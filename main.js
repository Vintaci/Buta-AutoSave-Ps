const { entrypoints } = require("uxp");

  entrypoints.setup({
    panels: {
      vanilla: {
        show(node ) {
        }
      }
    }
  });

  const savePathInput = document.getElementById('savePath');
  const fileName = document.getElementById('fileName');
  const intervalSelect = document.getElementById('intervalSelect');
  const changePathBtn = document.getElementById('changePathBtn');
  const toggleBtn = document.getElementById('btnStart');
  const app = require('photoshop').app;
  const ufs = require('uxp').storage.localFileSystem;

  var backupFolderName = "AutoSave";

  let timerId;

  let folder;
  let fileEntry;
  let backupFolder;
  let title;
  
  changePathBtn.addEventListener('click', async() => {
      if (toggleBtn.textContent === '停止') {
        clearInterval(timerId);
        savePathInput.value = null;
        toggleBtn.textContent = '开始';
      }
      
      if(!app.activeDocument){
        app.showAlert("请先打开一个.psd文件");
        fileName.value = null;
        return;
      }

      fileName.value = app.activeDocument.title;

      folder = await ufs.getFolder();

      title = app.activeDocument.title;
      if(!title.endsWith(".psd")){
        title = title+".psd";
      }

      fileEntry = await folder.createFile(title,{overwrite:true});
      console.log(fileEntry);

      app.activeDocument.save(fileEntry);

      savePathInput.value = folder.name

      backupFolder = await folder.createFolder(backupFolderName,{overwrite:true});
    }
  );

  toggleBtn.addEventListener('click', async() => {
    if (toggleBtn.textContent === '停止') {
      clearInterval(timerId);
      savePathInput.value = null;
      toggleBtn.textContent = '开始';
    } 
    else {
      console.log('click');

      if(!app.activeDocument){
        app.showAlert("请先打开一个.psd文件");
        fileName.value = null;
        return;
      }

      fileName.value = app.activeDocument.title;

      if (!savePathInput.value.length) {

        folder = await ufs.getFolder();
        title = app.activeDocument.title;
        if(!title.endsWith(".psd")){
          title = title+".psd";
        }

        fileEntry = await folder.createFile(title,{overwrite:true});
        console.log(fileEntry);

        app.activeDocument.save(fileEntry);

        savePathInput.value = folder.name

        backupFolder = await folder.createFolder(backupFolderName,{overwrite:true});
        return;
      }

      const interval = parseInt(intervalSelect.value, 10);
      timerId = setInterval(async() => {
          console.log('Saving to:', savePathInput.value);
          console.log('interval:', interval);
          // Call the Photoshop API to save the current document
          // app.activeDocument.save(fileEntry);

          if(!backupFolder){
            backupFolder = await folder.getEntry(backupFolderName);
          }

          console.log(backupFolder);
          let backupFile = await backupFolder.createFile(title,{overwrite:true});
          console.log(backupFile);
          app.activeDocument.save(backupFile);

        }, interval * 1000);
      toggleBtn.textContent = '停止';
    }
  }
);