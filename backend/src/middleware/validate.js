export const validate=(schema)=>(req,res,next)=>{const result=schema.safeParse(req.body);if(!result.success)return res.status(400).json({success:false,message:'Please check the submitted information.',errors:result.error.flatten().fieldErrors});req.validated=result.data;next()};

