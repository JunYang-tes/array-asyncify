## Issue
We cannot use async function graceful in array methods such as `filter`,`map`,`reduce` and so on.

So the following code do not work
```javascript
let a=[1,2,3]
a.map(async (e)=>{
  //some async operations
  //await ...
  return e+1
})
.filter(async (e)=>{
  //some async operations
  return e%2===0
})
```

## Resolution 

```javascript
const { asyncify } = require("array-asyncify")
let delay = (t) => new Promise(res => setTimeout(res), t)
console.log("Example:");
(async () => {

  let a = asyncify([1, 2, 3])
  console.log("ret:")
  let ret = await a
    .map(async (e) => {
      await delay(100);
      return e + 1
    })
    .map(async (e) => {
      await delay(100)
      return e * 2
    })
  console.log(ret)

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

```
## TODO
asyncify other method.