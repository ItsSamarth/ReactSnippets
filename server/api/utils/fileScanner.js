const NodeClam = require("clamscan");
const ClamScan = new NodeClam().init({
  debug_mode: true,
  scan_recursively: false
});

//SCAN FOR VIRUS
// async function scanUploads() {
//   try {
//     const clamscan = await new NodeClam().init();
//     console.log(__dirname + "../../uploads");
//     const { good_files, bad_files } = await clamscan.scan_dir(
//       path.join(__dirname, "../../uploads")
//     );
//     console.log("Good files are", good_files);
//     console.log("Bad files are", bad_files);
//   } catch (err) {
//     console.log(err);
//   }
// }

function scanFile(filePath) {
  return ClamScan.then(async clamscan => {
    const { is_infected, viruses } = await clamscan.scan_file(filePath);

    if (is_infected) {
      console.log(`The file is INFECTED with ${viruses}`);
      throw new Error("ERR_FILE_SCAN_INFECTED");
    } else {
      return "CLEAN";
    }
  }).catch(err => {
    throw new Error(err);
  });
}

module.exports = scanFile;
