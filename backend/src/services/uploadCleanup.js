import { rm } from 'node:fs/promises';
import path from 'node:path';
import { db } from '../config/database.js';
import { uploadDirectory } from '../config/storage.js';

export async function removeEntityUploads(kind,entityId){
  const[files]=await db.execute('SELECT stored_name FROM uploaded_files WHERE kind=? AND entity_id=?',[kind,entityId]);
  await db.execute('DELETE FROM uploaded_files WHERE kind=? AND entity_id=?',[kind,entityId]);
  await Promise.all(files.map((file)=>rm(path.join(uploadDirectory,file.stored_name),{force:true}).catch(()=>{})));
}
