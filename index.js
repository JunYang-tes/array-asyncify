const util = require("util")

function asyncify_(array) {
  let asyncArr = [...array]
  asyncArr.map = async function map(callback) {
    let ret = await array.map(callback)
    return asyncify_(ret)
  }
  asyncArr.filter = async function filter(callback) {
    let ret = []
    for (let ele of asyncArr) {
      if (await callback(ele)) {
        ret.push(ele)
      }
    }
    return asyncify_(ret)
  }
  asyncArr.reduce = async function reduce(callback, init) {
    if (array.length === 0) {
      if (init === undefined) {
        throw new Error("Reduce of empty array with no initial value")
      } else {
        return init
      }
    }
    let ret = init
    let idx = 0
    if (init === undefined) {
      ret = array[0]
      idx = 1
    }
    for (; idx < array.length; idx++) {
      ret = callback(await ret, await array[idx])
    }
    return ret
  }
  asyncArr.forEach = async function forEach(callback) {
    for (let i = 0; i < array.length; i++) {
      await callback(array[i], i, array)
    }
  }

  return asyncArr
}

class Asyncify {
  constructor(array) {


    this.original_ = array
    this.actions_ = []
    this.array_ = asyncify_(array)
    this.length_ = array.length
  }
  map(callback) {
    this.actions_.push({
      "method": "map",
      params: [callback]
    })
    return this
  }
  filter(callback) {
    this.actions_.push({
      method: "filter",
      params: [callback]
    })
    return this
  }
  reduce(callback, init) {
    this.actions_.push({
      method: "reduce",
      params: [callback, init]
    })
    return this
  }
  forEach(callback) {
    this.actions_.push({
      method: "forEach",
      params: [callback]
    })
    return this
  }
  async apply() {
    let array = this.array_;
    for (var i = 0; i < this.actions_.length; i++) {
      let action = this.actions_[i]
      let ret = await array[action.method](...action.params)
      if (ret instanceof Array) {
        array = asyncify_(
          (await Promise.all(ret))
        )
      } else if (i === this.actions_.length - 1) {
        return await ret
      } else {
        throw new Error("cannot call other function on a non-asycnified value")
      }
    }
    return Array.from(await Promise.all(array))
  }
  inspect(...parmas) {
    return `a${util.inspect(this.original_)}`
  }
}
module.exports = {
  asyncify(arr) {
    let asyncified = new Asyncify(arr)
    asyncified.then = function (res, rej) {
      asyncified.apply().then(res, rej)
    }
    return asyncified;
  }
}