const GEN_ID = "Generate new ID";

module.exports = {
  GEN_ID,
  properties: {
    upload: {
      'default': 'y',
      'require': true
    },
    protocol: {
      'default': 'https',
      'require': true
    },
    server: {
      'default': 'example.com',
      'required': true
    },
    port: {
      'default': 3000,
      'required': true
    },
    deviceID: {
      'default': GEN_ID,
      'required': true
    }
  }
};