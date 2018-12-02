const GEN_ID = "Generate new ID";

module.exports = {
  GEN_ID,
  properties: {
    uploadURL: {
      'default': 'https://example.com',
      'required': true
    },
    deviceID: {
      'default': GEN_ID,
      'required': true
    },
    imageFilePath: {
      'default': '/dev/shm/current.jpg',
      'required': true
    }
  }
};