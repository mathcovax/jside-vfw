window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
window.directoryEntry = window.directoryEntry || window.webkitDirectoryEntry;
window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL ||  window.webkitResolveLocalFileSystemURL;

let fileSystem

const launchFileSystem = async (size=1000000000) => {
    return new Promise((resolve) => {
        navigator.webkitPersistentStorage.requestQuota(size, (rep) => {
            if(rep == 0){
                resolve(false)
            }
            else{
                window.requestFileSystem(window.TEMPORARY, size, (fs) => {
                    fs.root.getDirectory("temp", { create: true }, (directoryEntry) => {
                        fileSystem = directoryEntry
                        resolve(true)
                    }, errorHandler);
                });
            }
        }, errorHandler)
    })
}


const loopDir = async (path) => {
    return new Promise((resolve) => {
        fileSystem.getDirectory(path, { create: true }, (directoryEntry) => {
            let temp = directoryEntry.createReader()
            temp.readEntries((rep) => {
                resolve(rep)
            }, errorHandler)
        }, errorHandler)
    })
}

const removeDir = async (path) => {
    return new Promise((resolve) => {
        fileSystem.getDirectory(path, { create: true }, (directoryEntry) => {
            directoryEntry.removeRecursively(() => {
                resolve()
            }, errorHandler)
        }, errorHandler)
    })
}

const removeFile = async (path) => {
    return new Promise((resolve) => {
        fileSystem.getFile(path, { create: true }, (file) => {
            file.remove(() => {
                resolve()
            }, errorHandler)
        })
    })
}

const createDir = (path) => {
    return new Promise((resolve) => {
        fileSystem.getDirectory(path, { create: true }, (directoryEntry) => {
            resolve()
        }, errorHandler)
    })
}

const writeFile = async (path, base64) => {
    if(await fileExist(path)){
        await removeFile(path)
    }
    return new Promise((resolve) => {
        fileSystem.getFile(path, { create: true }, (file) => {
            file.createWriter((content) => {
                content.write(base64toBlob(base64));
                resolve()
            }, errorHandler);
        }, errorHandler)
    })
}

const appendFile = async (path, base64) => {
    return new Promise((resolve) => {
        fileSystem.getFile(path, { create: true }, (file) => {
            file.createWriter((content) => {
                content.seek(content.length)
                content.write(base64toBlob(base64));
                resolve()
            }, errorHandler);
        }, errorHandler)
    })
}

const folderExist = async (path) => {
    return new Promise((resolve) => {
        fileSystem.getDirectory(path, {}, () => {
            resolve(true)
        }, () => resolve(false))
    })
}

const fileExist = async (path) => {
    return new Promise((resolve) => {
        fileSystem.getFile(path, {}, () => {
            resolve(true)
        }, () => resolve(false))
    })
}

const readFile = async (path) => {
    return new Promise((resolve) => {
        fileSystem.getFile(path, {}, (fileEntry) => {
            fileEntry.file((file) => {
                const reader = new FileReader();
                reader.addEventListener("loadend", () => {
                    resolve(JSON.parse(reader.result))
                });
                reader.readAsText(file);
            })
        }, errorHandler)
    })
}

function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);
 
    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);
 
        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}

function errorHandler(e) {
    console.error(e);
}