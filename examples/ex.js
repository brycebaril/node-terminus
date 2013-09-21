var terminus = require("../terminus")
var through2 = require("through2")
var spigot = require("stream-spigot")

// Streams2 all the way down...

function uc(chunk, encoding, callback) {
  this.push(chunk.toString().toUpperCase())
  callback()
}

function log(chunk, encoding, callback) {
  // This example is very contrived, you're likely better off directly piping to `process.stdout`
  console.log(chunk.toString())
  callback()
}

spigot(["my ", "dog ", "has ", "fleas"])
  .pipe(through2(uc))
  .pipe(terminus(log))

// devnull

var spy = require("through2-spy")

spigot(["my ", "dog ", "has ", "fleas"])
  .pipe(spy({highWaterMark: 2}, function (buf) {console.log(buf.toString())}))
  .pipe(terminus.devnull())

// concat

function reverse(contents) {
  console.log(contents.toString().split("").reverse().join(""))
}

spigot(["my ", "dog ", "has ", "fleas"])
  .pipe(terminus.concat(reverse))

// tail

var chunkLengths = []
function logLength(chunk) {
  chunkLengths.push(chunk.length)
}

var ws = terminus.tail(logLength)
ws.on("finish", function () {
  console.log(chunkLengths)
})

spigot(["my ", "dog ", "has ", "fleas"])
  .pipe(ws)

// objectMode

var s = spigot({objectMode: true}, [
  {foo: 1},
  {foo: 2},
  {foo: 3},
  {foo: 4},
])

function timesTwo(record, encoding, callback) {
  record.foo *= 2
  this.push(record)
  callback()
}

function logRecords(records) {
  console.log(records)
}

s.pipe(through2({objectMode: true}, timesTwo))
 .pipe(terminus.concat({objectMode: true}, logRecords))