export function notFound(req,res){res.status(404).json({success:false,message:'The requested resource was not found.'})}
export function errorHandler(error,req,res,next){void next;const status=error.status||500;if(process.env.NODE_ENV!=='test')console.error(error);res.status(status).json({success:false,message:status===500&&process.env.NODE_ENV==='production'?'Something went wrong.':error.message||'Something went wrong.'})}

