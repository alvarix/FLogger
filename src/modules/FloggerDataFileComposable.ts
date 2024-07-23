export interface IFloggerDataFileComposable {
  dataFileName: string;
  dataFilePermissions: string;
  dataFileSave: (fileDataObj: any) => void; // Should be fileDataObj: <SOME TYPE FOR FLOGGER FILE DATA>
  dataFileClose: () => void;
  // Not sure if there's a reason to make these public, or part of the Flogger interface anyway
  // dataFileClickToOpen: () => void;
  // dataFileClickToRequestPermission: () => void;
  // dataFileGetFileHandle: () => FileSystemFileHandle[] | undefined;
  // dataFileCheckPermissions: () => void; 
  // dataFileLoad: () => void // Calls dataLoadedCallback( dataFileDataObj )
  // dataFileReload: (file_id: string) => void;
}

