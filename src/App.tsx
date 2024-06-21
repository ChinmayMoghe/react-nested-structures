import { Fragment,  useState } from "react";
import './App.css';

interface FileStruct {
  name: string,
}

interface FolderStruct {
  name:string,
  isOpen?:boolean,
  files:Array<FileStruct|FolderStruct>
}

const initialFolderStructure:Array<FileStruct|FolderStruct> = [
  {name:'node_modules'},
  {name:'public',isOpen:true,files:[{name:'index.html'},{name:'images',isOpen:false,files:[{name:'vite.svg'}]}]},
];


interface FileComponentProps {
  file:FileStruct,
  markAsFolder:MarkAsFolder,
  path:Array<string>
}

interface FolderComponentProps {
  folder:FolderStruct,
  addFile:AddFileFn,
  markAsFolder:MarkAsFolder,
  path:Array<string>
}

interface FileListProps {
  files:Array<FolderStruct|FileStruct>,
  addFile:AddFileFn,
  markAsFolder:MarkAsFolder,
  path:Array<string>
    }

/*renders a file*/
function File({file,markAsFolder,path}:FileComponentProps) {
  return     <li className="list_item">
      <button type="button" onDoubleClick={()=>markAsFolder(path)}>{file.name}</button>
    </li>;
};

interface AddFileActionProps {
  addFile:AddFileFn,
  path:Array<string>,
}

function AddFileAction  ({addFile,path}:AddFileActionProps)  {
  const [fileName,setFileName] = useState('');
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
  }
  const handleAddFileName = () => {
    addFile(path,fileName.trim());
    setFileName('');
  }
  return (
  <div className="add_file_action">
    <input type="text" value={fileName} onChange={handleFileChange}/>
    <button type="button" onClick={handleAddFileName}>+</button>
    </div>
  )
}

/*renders a folder item*/
function Folder({folder,markAsFolder,addFile,path}:FolderComponentProps) {
  const [open,setOpen] = useState<boolean>(folder?.isOpen ?? false);
  const toggleFolderOpen = () => setOpen((prev)=>!prev);
  return <>
    <li className="list_item">
      <button className="folder_btn" type="button" onClick={toggleFolderOpen}>
        <span>[ {open ? '-':'+'} ]</span>
        <span>{folder.name}</span>
        </button>
{open && <FileList files={folder.files} addFile={addFile} markAsFolder={markAsFolder} path={[...path,folder.name]}/>
  }
</li>
    </>;
};

  const isaFolder = (fileOrFolder:FileStruct | FolderStruct) : fileOrFolder is FolderStruct => {
    return (fileOrFolder as FolderStruct).files !== undefined;
  }
/*renders a complete file / folder list*/
function FileList({files,addFile,markAsFolder,path}:FileListProps) {
  return <> 
    <AddFileAction addFile={addFile} path={path}/>
    <ul className="file_list">
      {files.map((file:FileStruct|FolderStruct,idx:number)=>{
        return <Fragment key={`${file.name}_${idx}`}>
          {isaFolder(file) && <Folder folder={file} addFile={addFile} markAsFolder={markAsFolder} path={path}/>}
          {!isaFolder(file) && <File file={file} markAsFolder={markAsFolder} path={[...path,file.name]}/>}
          </Fragment>
      })}
    </ul></>;
};


type AddFileFn = (pathToAddFile:Array<string>,fileName:string) => void;
type MarkAsFolder = (pathToFile:Array<string>) => void;
function App() {
  const [files,setFiles] = useState(initialFolderStructure);

const addFile = (pathToAddFile:Array<string>,fileName:string):void => {
  if(!fileName) {
    alert('File name cannot be blank! you idiot!');
    return;
  }
    const folderToAddFileTo = pathToAddFile[pathToAddFile.length - 1];
    const addFileToFolder = (path:Array<string>,files:Array<FileStruct|FolderStruct>):Array<FileStruct|FolderStruct> => {
      const currentPath = path[0];
      if(currentPath === undefined) {
        return [...files,{name:fileName}];
      }

      if(currentPath === '/' && folderToAddFileTo !== '/') {
        return addFileToFolder(path.slice(1,),files);
      }
      
      if(currentPath === '/' && folderToAddFileTo === '/') {
        return [...files,{name:fileName}];
      }
      
       const newFiles = files.map((fileOrFolder)=>{
        if(fileOrFolder.name === currentPath && isaFolder(fileOrFolder)) {
          return {...fileOrFolder,files:addFileToFolder(path.slice(1,),fileOrFolder.files)}
        }
        if(fileOrFolder.name === folderToAddFileTo && isaFolder(fileOrFolder)) {
          return {...fileOrFolder,files:[...fileOrFolder.files,{name:fileName}]}
        }
        return fileOrFolder;
      });
      return newFiles;
    }

    setFiles((prevFiles)=>{
      const newFiles = addFileToFolder(pathToAddFile,prevFiles);
      return newFiles;
    });
  };

  const markAsFolder = (pathToFile:Array<string>):void => {
    const markAsFolderAtPath = (path:Array<string>,files:Array<FileStruct|FolderStruct>):Array<FileStruct|FolderStruct> => {
      const currentPath = path[0];
      if(currentPath === undefined) {
        return [];
      }
      if(currentPath === '/') {
        return markAsFolderAtPath(path.slice(1,),files);
      }
      const newFiles = files.map((fileOrFolder)=>{
        if(fileOrFolder.name === currentPath && isaFolder(fileOrFolder)){
          return {...fileOrFolder,files:markAsFolderAtPath(path.slice(1,),fileOrFolder.files)}
        }
        if (fileOrFolder.name === currentPath && !isaFolder(fileOrFolder)){
          return {...fileOrFolder,isOpen:false,files:[]};
        }
          return fileOrFolder;
      });
      return newFiles;
    }
    setFiles((prevFiles)=>{
      const newFiles = markAsFolderAtPath(pathToFile,prevFiles);
      return newFiles;
    });
  };
  
  return (
    <>
      <FileList files={files} addFile={addFile} markAsFolder={markAsFolder} path={['/']}/>
    </>
  )
}

export default App
