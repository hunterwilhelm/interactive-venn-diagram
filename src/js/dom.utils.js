// http://www.mikechambers.com/blog/2014/07/01/saving-svg-content-from-paper.js/
export function downloadAsSVG(fileName) {
  let project = paper.project;
  if (!fileName) {
    fileName = "untitled.svg"
  }
  let url = "data:image/svg+xml;utf8," + encodeURIComponent(project.exportSVG({asString: true}));
  let link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  link.click();
}
