const { asyncify } = require("./index")
let delay = (t) => new Promise(res => setTimeout(res, t))
console.log("Example:");
(async () => {
  let a = asyncify([1, 2, 3])
  console.log("ret:")
  let ret = await a
    .map(async (e) => {
      await delay(100);
      console.log("@map1")
      return e + 1
    })
    .map(async (e) => {
      await delay(100)
      console.log("@map2")
      return e * 2
    })
  console.log(ret)
  console.log("============")

  await asyncify([1, 2, 3])
    .map(async (e) => {
      console.log("@map3")
      await delay(100)
      return e + 1
    })
    .forEach(async (e) => {
      await delay(100)
      console.log("@forEach", e)
    })


  console.log("=============")
  try {
    let b = asyncify([1, Promise.resolve(2), 3])
    console.log("sum:", await b.reduce(async (p, n) => {
      console.log("p,n", p, n)
      return p + n
    }))
  } catch (e) {
    console.log(e)
  }


})()


