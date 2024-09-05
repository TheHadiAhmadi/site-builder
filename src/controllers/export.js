import { db } from "#services"
import JSZip from "jszip"

export const exportSiteController = async(req, res) => {
    const settings = await db('settings').query().first()
    const fileName = 'backup_' + (settings.site_name ? settings.site_name + '_' : '') + new Date().toISOString().split('T')[0]
    
    const jszip = new JSZip()

    const files = await getExportFiles()
    for(let key in files) {
        jszip.file(fileName + '/' + key, files[key])
    }
    
    const content = await jszip.generateAsync({type: 'nodebuffer'})

    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName  + '.zip');
    res.setHeader('Content-Type', 'application/zip');
    res.send(content)
}