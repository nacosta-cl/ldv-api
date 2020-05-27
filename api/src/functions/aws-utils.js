const fs = require('fs');
const path = require('path');
const util = require('util');

const fsDeleteFile = util.promisify(fs.unlink);

const s3UploadStandardTarget = async function (ctx, fileElement, uploadPath) {
  try {
    const uploadParams = {
      Bucket: ctx.aws.S3BucketParams.Bucket,
      ACL: 'public-read',
    };
    const tgtFile = fs.createReadStream(fileElement);
    ctx.aws.S3BucketParams.Body = tgtFile;
    ctx.aws.S3BucketParams.Key = `${uploadPath}/${path.basename(tgtFile.path)}`;
    const fileRes = await ctx.aws.S3.upload(ctx.aws.S3BucketParams).promise();
    await fsDeleteFile(tgtFile.path);
    delete ctx.aws.S3BucketParams.ContentType;
    return `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${fileRes.Location.split('/').splice(3, 99).join('/')}`;
  } catch (err) {
    console.error('File upload unsuccesful');
    console.error(err);
    await ctx.throw(500);
  }
};

module.exports = {
  s3UploadStandardTarget,
};
