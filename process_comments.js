//The pouchDB instance, connect to the haskell_stack_pr_comments database from Cloudant.
var dbRemote = new PouchDB('https://fc535eaf-52c1-47a3-acf6-c990cfa80dfd-bluemix:e01ad0f8a3355ea74bf8efeb523cd6da8e8afe94f5a26b2e6af4a7112dd1d144@fc535eaf-52c1-47a3-acf6-c990cfa80dfd-bluemix.cloudantnosqldb.appdomain.cloud/haskell_stack_pr_comments');

//The local pouchDb instance
var dbLocal = new PouchDB('db');

//The amount number of comments.
var commentsAmount;

//Copy cloudant db to local.
dbLocal.replicate.from(dbRemote);

//Use a array of Object to contain the result.
records = [];


dbLocal.info(function (err, doc) {
    if (err) { return console.log(err); }
    commentsAmount = doc.doc_count;
}).then(function(){
for(var i=0;i<commentsAmount;i++)
{
    dbLocal.get(i.toString(), function(err, json) {
        if (err) { return console.log(err); }
        var newRecord = true;
        for(var j=0;j<records.length;j++)
        {
            if(records[j].id === json.id)
            {
                records[j].comments_received += json.comments.length;
                newRecord = false;
            }
        }
        if(newRecord)
        {
            var addRecord = {"login" : json.login,"id" : json.id,"comments_received" : 0,"comments_given" : 0};
            records.push(addRecord);
        }
      });
}
}).then(function(){

for(var i=0;i<commentsAmount;i++)
{
    dbLocal.get(i.toString(), function(err, json) {
        if (err) { return console.log(err); }
        for(var j=0;j<json.comments.length;j++)
        {
            for(var k=0;k<records.length;k++)
            {
                if(json.comments[j].user.id === records[k].id)
                {
                    records[k].comments_given++;
                }
            }
        }
      });
}

}).then(function(){
    console.log(records);
});
