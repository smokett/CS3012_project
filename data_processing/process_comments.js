var collectedDataAddress = 'https://fc535eaf-52c1-47a3-acf6-c990cfa80dfd-bluemix:e01ad0f8a3355ea74bf8efeb523cd6da8e8afe94f5a26b2e6af4a7112dd1d144@fc535eaf-52c1-47a3-acf6-c990cfa80dfd-bluemix.cloudantnosqldb.appdomain.cloud/arduino_pr_comments';
var dataToShowAddress = 'https://fc535eaf-52c1-47a3-acf6-c990cfa80dfd-bluemix:e01ad0f8a3355ea74bf8efeb523cd6da8e8afe94f5a26b2e6af4a7112dd1d144@fc535eaf-52c1-47a3-acf6-c990cfa80dfd-bluemix.cloudantnosqldb.appdomain.cloud/show_data';

//The pouchDB instance, connect to the haskell_stack_pr_comments database from Cloudant.
var dbRemote = new PouchDB(collectedDataAddress);

//The db to connect after finish.
var dbData = new PouchDB(dataToShowAddress);

//The local pouchDb instance
var dbLocal = new PouchDB('db');

//The amount number of comments.
var commentsAmount;

//Use a array of Object to contain the result.
records = [];



dbRemote.allDocs({include_docs: true},function (err, raw) {
    if (err) { return console.log(err); }

    for(var i=0;i<raw.rows.length;i++)
    {
        var newRecord = true;
        for(var j=0;j<records.length;j++)
        {
            if(records[j].id === raw.rows[i].doc.id)
            {
                records[j].PR_own++;
                for(var k=0;k<raw.rows[i].doc.comments.length;k++)
                {
                    if(raw.rows[i].doc.comments[k].user.id != records[j].id)
                    {
                        records[j].comments_received++;
                    }
                }
                newRecord = false;
            }
        }
        if(newRecord)
        {
            var addRecord = {"login" : raw.rows[i].doc.login,"id" : raw.rows[i].doc.id,"comments_received" : 0,"comments_given" : 0,"PR_own" : 0,"comments_received_per_PR" : 0};
            records.push(addRecord);
        }
    }

    for(var i=0;i<raw.rows.length;i++)
    {
        for(var j=0;j<raw.rows[i].doc.comments.length;j++)
        {
            for(var k=0;k<records.length;k++)
            {
                if(raw.rows[i].doc.comments[j].user.id === records[k].id && raw.rows[i].doc.id != records[k].id)
                {
                    records[k].comments_given++;
                }
            }
        }

    }

    for(var j=0;j<records.length;j++)
    {
        if(records[j].PR_own>0)
        {
             var PR = records[j].PR_own;
             var comments = records[j].comments_received;
             var per = comments/PR;
            records[j].comments_received_per_PR = records[j].comments_received / records[j].PR_own;
        }
    }

    //The data to be showed
    var data = [];
    var theData = {_id : "2",name : "comments under PR",children : []};
    for(var i=0;i<records.length;i++)
    {
        if(records[i].PR_own>0)
        {
            var aCoder = {name : "Number of PR owned by "+records[i].login,rank : records[i].PR_own,children : []};           
            var comments_given = {name : "comments given",size : records[i].comments_given,rank : records[i].comments_given};
            aCoder.children.push(comments_given);
            var comments_received = {name : "comments received",size : records[i].comments_received,rank : records[i].comments_received};
            aCoder.children.push(comments_received);
            theData.children.push(aCoder);
        }
    }
    data.push(theData);
    console.log(data);
    dbData.bulkDocs(data).then(function (result) {
        console.log(result);
        }).catch(function (err) {
        console.log(err);
        });
     
});


    





















