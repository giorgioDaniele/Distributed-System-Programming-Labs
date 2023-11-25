const Path        = require('path')
const gRPC        = require('@grpc/grpc-js')
const Loader      = require('@grpc/proto-loader')
const { error } = require('console')


const defs = Loader.loadSync(
  Path.join(__dirname + '/../resources/proto/', 'conversion.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
})

const Conversion = gRPC.loadPackageDefinition(defs).conversion
const gRPClient  = new Conversion.Converter('localhost:8081', gRPC.credentials.createInsecure())

const fileConverter = async (meta, bytes, sink) => {


  const call   = gRPClient.fileConvert()
  let result = Buffer.alloc(0);

  call.on('data', msg => {
    if(msg.request_oneof == 'file') {
      result = Buffer.concat([result, msg.file]);
    }
  })
  call.on('end', () => {
    sink(result)
  })
  call.write({meta: meta})
  call.write({file: bytes})
  call.end()
  
}

module.exports = {
  fileConverter
} 


