const fs = require('fs');

function writePostsToFile(filePath, dataObject) {
  const data = JSON.stringify(dataObject);

  try {
    fs.writeFileSync(filePath, data);
    console.log('JSON data is saved.');
  } catch (error) {
    console.error(err);
  }
}

module.exports = writePostsToFile;
