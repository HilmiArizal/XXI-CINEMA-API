const multer = require('multer');
const fs = require('fs');

module.exports = {
    uploader(destination, fileNamePrefix){
        let defaultPath = './Public';
        
        const storage = multer.diskStorage({
            destination: (req, file, cb) =>{
                let dir = defaultPath + destination;
                if(fs.existsSync(dir)){
                    console.log(dir, 'exist')
                    cb(null, dir)
                }else{
                    fs.mkdir(dir, {recursive: true}, err => cb(err, dir))
                    console.log(dir, 'make')
                }
            },
            filename: (req, file, cb) => {
                let originalname = file.originalname;
                let ext = originalname.split('.');
                let filename = fileNamePrefix + Date.now() + '.' + ext[ext.length - 1]
                cb(null, filename)
            }
        })

        const fileFilter = (req, file, cb) => {
            let ext = /\.(JPG|jpg|jpeg|png|gif|pdf|doc|docx|xlsx)$/;
            if(!file.originalname.match(ext)){
                return cb(new Error('Image format not supported'), false);
            }
            cb(null, true)
        }

        return multer({
            storage: storage,
            fileFilter: fileFilter
        })
    }
}