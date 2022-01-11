// const testLoader = {
//   normal: (content) => {
//     //console.log(`loader content: ${content}`);
//     return content;
//   },
//   pitch: function (request) {
//     console.log("picth: " + request);
//     return true;
//   },
// };

module.exports = function (content) {
  console.log("normal");
  return content;
};
module.exports.pitch = function (request) {
  console.log("picth: " + request);
  return undefined;
};
