const SparqlClient = require('sparql-client-2');
const SPARQL = SparqlClient.SPARQL;
const endpoint = 'http://informationsystems.wiki:3030/bus0505/sparql';
const client = new SparqlClient(endpoint)
var express = require('express')
var router = express.Router();
var query;
var qres;

//HOME
router.get('/', function (req, res) {

var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('subject_journals.json', 'utf8'));
console.dir(obj)
res.render('index',{"qres":obj})
})

//SOURCE_KEYWORDS
function source_keys(req, res,next) {
  var issn = req.query.issn;
  query =SPARQL`
select ?keyword (count(*) as ?count)
{
  ?s <e:keyword> ?keyword.
  ?s <e:issn> ?source.
  ?s <e:issn> "`+issn+`"
}
group by ?keyword
order by desc(?count)
limit 10`;
 client.query(query)
 .execute()
 .then(function (results) {
  qres=results['results']['bindings'], {depth: null};
  console.dir(qres);
  req.keys=qres;
  return next();
}); 
}

//SOURCE_AUTHORS
function source_authors(req, res,next) {
  var issn = req.query.issn;
  query =SPARQL`
select ?creator (count(distinct ?t) as ?count)
{
  ?s <e:title> ?t.
  ?s <e:author> ?creator.
  ?s <e:issn> "`+issn+`"
}
group by ?creator
order by desc(?count)
limit 10`;
 client.query(query)
 .execute()
 .then(function (results) {
  qres=results['results']['bindings'], {depth: null};
  console.dir(qres);
  req.creators=qres;
  return next();
}); 
}

//SOURCE_ARTICLES
function source_articles(req, res,next) {
  var issn = req.query.issn;
  query =SPARQL`
  SELECT distinct ?id ?title ?year ?citation
  WHERE {
   ?id <e:issn> "`+issn+`";
    <e:title> ?title;
    <e:year> ?year;
   optional{?id <e:citation> ?citation}
 }
 order by desc(?citation)
 LIMIT 10`;
 client.query(query)
 .execute({format: {resource: 'title'}})
 .then(function (results) {
  qres=results['results']['bindings'], {depth: null};
  console.dir(qres);
  req.articles=qres;
  return next();
}); 
}

//SOURCE_YEARS
function source_years(req, res) {
  var issn = req.query.issn;
  var journal = req.query.journal;
  query =SPARQL`
  SELECT distinct ?year (concat(str(?volume),'_',str(?issue)) as ?vol_iss)
  WHERE {
   ?s <e:year> ?year.
   ?s <e:volume> ?volume.
   ?s <e:issue> ?issue.
   ?s <e:issn> "`+issn+`"
 }
 order by desc (?year)
 LIMIT 500`;
 client.query(query)
 .execute({format: {resource: 'year'}})
 .then(function (results) {
  qres=results['results']['bindings'], {depth: null}; 
  console.dir(qres);
  var years=[]
  for (var i=0; i<qres.length;i++){
    var year=Number(qres[i].year.value)
    if (!isNaN(year)){years.push(year)}
  }
  var min=Math.min(...years)
  var max=Math.max(...years)  
  console.dir(years);

  res.render('source',{	  
	  qkeys:req.keys, qcreators:req.creators, qarticles:req.articles, qyears:qres,issn:issn, journal:journal,
	  years:years,min:min,max:max
	  }
	  )}).catch(function (error) {console.dir(error);
});  
}
router.get('/source', source_keys,source_authors,source_articles, source_years)

//YEAR_ARTICLES
router.get('/year_articles', function (req, res) {
  var issn = req.query.issn;
  var journal = req.query.journal;
  var year = req.query.year;
  query =SPARQL`
  SELECT distinct ?id ?title ?creator ?citation
  WHERE {
   ?id <e:year> `+year+`;
    <e:issn> "`+issn+`";
    <e:title> ?title;
    <e:author> ?creator;
   optional{?id <e:citation> ?citation}
 }
 order by desc(?citation)
 LIMIT 500`;

 client.query(query)
 .execute({format: {resource: 'title'}})
 .then(function (results) {
  qres=results['results']['bindings'], {depth: null};
  console.dir(qres);
  res.render('year_articles',{"qres":qres,issn:issn,journal:journal,year:year})}).catch(function (error) {console.dir(error);
});  
})

//Article
function article(req, res,next) {
  var issn = req.query.issn;
  var journal = req.query.journal;
  var year = req.query.year;
  var id = req.query.id
  query =SPARQL`
  SELECT distinct ?id ?title ?source ?year ?creator ?abstract ?keyword ?citation ?issn ?journal
  WHERE {
   <`+id+`> <e:title> ?title.
   ?id <e:title> ?title;
      <e:journal> ?source;
      <e:author> ?creator;
      <e:issn> ?issn;
      <e:journal> ?journal.
   optional{?id <e:year> ?year.}
   optional{?id <e:abstract> ?abstract.}
   optional{?id <e:keyword> ?keyword.}
   optional{?id <e:citation> ?citation.}
  }
  order by desc(?year)
 LIMIT 100`;
 console.dir(query);
 client.query(query)
 .execute({format: {resource: 'title'}})//
 .then(function (results) {
  qres=results['results']['bindings'], {depth: null};
  console.dir(qres);
  req.qarticle=qres;
  return next();

});  
}

//Article_reference
function article_reference (req, res, next) {
  var issn = req.query.issn;
  var journal = req.query.journal;
  var year = req.query.year;
  var id = req.query.id
  query =SPARQL`
  SELECT distinct ?id ?title ?journal ?year
  WHERE {
   <`+id+`> <e:reference> ?reference. 
   ?id <e:doi> ?reference;
    <e:title> ?title;
    <e:journal> ?journal
  optional{?id <e:year> ?year.}

  }
  order by desc(?year)
 LIMIT 100`;
 console.dir(query);
 client.query(query)
 .execute()//
 .then(function (results) {
  qreference=results['results']['bindings'], {depth: null};
  console.dir(qreference);
  req.qreference=qreference;
  return next();
});  
}
//Article_citation
function article_citation (req, res) {
  var issn = req.query.issn;
  var journal = req.query.journal;
  var year = req.query.year;
  var id = req.query.id
  query =SPARQL`
  SELECT distinct ?id ?title ?journal ?year
  WHERE {
   <`+id+`> <e:doi> ?doi. 
   ?id <e:reference> ?doi;
    <e:title> ?title;
    <e:journal> ?journal
  optional{?id <e:year> ?year.}

  }
  order by desc(?year)
 LIMIT 100`;
 console.dir(query);
 client.query(query)
 .execute()//
 .then(function (results) {
  qcitation=results['results']['bindings'], {depth: null};
  console.dir(qcitation);
  res.render('article',{qcitation:qcitation,qreference:req.qreference,qarticle:req.qarticle,issn:issn,journal:journal,year:year})}).catch(function (error) {console.dir(error);
});  
}
router.get('/article', article, article_reference,article_citation)


//Author_issn
function author_issn(req, res, next) {
  var name = req.query.name
  var issn = req.query.issn
  var journal = req.query.journal
  query =SPARQL`
  SELECT ?id ?title ?year ?creator ?keyword ?citation
  WHERE {
   ?id <e:title> ?title;
    <e:issn> "`+issn+`";
    <e:author> ?creator;
    <e:year> ?year;
    <e:author> "`+name+`";
   optional{?id <e:citation> ?citation.}
  }
 order by desc(?citation)
 LIMIT 500`;
 console.dir(query);
 client.query(query)
 .execute({format: {resource: 'title'}})//
 .then(function (results) {
  qres=results['results']['bindings'], {depth: null};
  console.dir(qres);
  req.author_issn=qres;
  return next();
  }).catch(function (error) {console.dir(error);
});  
}
//Author_other
function author_other(req, res) {
  var name = req.query.name
  var issn = req.query.issn
  var journal = req.query.journal
  query =SPARQL`
  SELECT ?id ?title ?journal ?year ?creator ?keyword ?citation
  WHERE {
   ?id <e:title> ?title;
    <e:journal> ?journal;
    <e:year> ?year;
    <e:author> ?creator;
    <e:author> "`+name+`";
   optional{?id <e:citation> ?citation.}
   filter NOT EXISTS {?id <e:issn> "`+issn+`"}
  }
 order by desc(?citation)
 LIMIT 500`;
 console.dir(query);
 client.query(query)
 .execute({format: {resource: 'title'}})//
 .then(function (results) {
  author_other=results['results']['bindings'], {depth: null};
  console.dir(qres);
  res.render('author',{qauthor_issn:req.author_issn,author_other:author_other, issn:issn, journal:journal, name:name})}).catch(function (error) {console.dir(error);
});  
}
router.get('/author', author_issn,author_other)

//Keyword_issn
function keyword_issn(req, res,next) {
  var issn = req.query.issn
  var journal = req.query.journal
  var keyword = req.query.keyword
  query =SPARQL`
  SELECT ?id ?title ?journal ?year ?creator ?keyword ?citation
  WHERE {
   ?id <e:title> ?title;
    <e:journal> ?journal;
	<e:issn> "`+issn+`";
    <e:author> ?creator;
    <e:year> ?year;
    <e:keyword> ?keyword;
    <e:keyword> "`+keyword+`";
    optional {?id <e:citation> ?citation. }
  }
 order by desc(?citation)
 LIMIT 500`;
 console.dir(query);
 client.query(query)
 .execute({format: {resource: 'title'}})//
 .then(function (results) {
  qres=results['results']['bindings'], {depth: null};
  req.keyword_issn=qres
  console.dir(qres);
  return next();
  }).catch(function (error) {console.dir(error);
});  
}
//Keyword_other
function keyword_other(req, res) {
  var issn = req.query.issn
  var journal = req.query.journal
  var keyword = req.query.keyword
  query =SPARQL`
  SELECT ?id ?title ?journal ?year ?creator ?keyword ?citation
  WHERE {
   ?id <e:title> ?title;
    <e:journal> ?journal;
    <e:author> ?creator;
    <e:year> ?year;
    <e:keyword> ?keyword;
    optional {?id <e:citation> ?citation. }
   filter NOT EXISTS {?id <e:issn> "`+issn+`"}
}
 order by desc(?citation)
 LIMIT 500`;
 console.dir(query);
 client.query(query)
 .execute({format: {resource: 'title'}})//
 .then(function (results) {
  qkeyword_other=results['results']['bindings'], {depth: null};
  console.dir(qres);

  res.render('keyword',{qkeyword_issn:req.keyword_issn, qkeyword_other:qkeyword_other, issn:issn, journal:journal, keyword:keyword})}).catch(function (error) {console.dir(error);
});  
}
router.get('/keyword', keyword_issn, keyword_other)

//Search
router.get('/search', function (req, res) {
  var search_by=req.query.search_by
  var sort_by = req.query.sort_by;	
  if (req.query.input){
    var input = req.query.input.toLowerCase().trim();
    if (search_by=="title"){
      query =SPARQL`
      SELECT distinct ?id ?title ?issn ?journal ?year ?creator ?citation
      WHERE {
       ?id <e:title> ?title;
        <e:journal> ?journal;
        <e:issn> ?issn;
        <e:author> ?creator;
        <e:year> ?year;
       optional{?id <e:citation> ?citation.}
       filter contains(lcase(?title),"`+input+`")  
     }
     order by desc(?`+sort_by+`)
     LIMIT 500`;

     client.query(query)
     .execute({format: {resource: 'title'}})
     .then(function (results) {
      qres=results['results']['bindings'], {depth: null};
      console.dir(qres);
      res.render('search',{"qres":qres,"input":input,search_by:search_by,sort_by:sort_by})}).catch(function (error) {console.dir(error);
      });
    }
    if (search_by=="author"){
      query =SPARQL`
      SELECT distinct ?id ?title ?issn ?journal ?year ?creator ?citation
      WHERE {
       ?id <e:title> ?title;
        <e:journal> ?journal;
        <e:issn> ?issn;		
        <e:author> ?creator;
        <e:year> ?year; 
       optional{?id <e:citation> ?citation.}	   
       filter contains(lcase(?creator),"`+input+`")  
     }
     order by desc(?`+sort_by+`)
     LIMIT 500`;

     client.query(query)
     .execute({format: {resource: 'title'}})
     .then(function (results) {
      qres=results['results']['bindings'], {depth: null};
      console.dir(qres);
      res.render('search',{"qres":qres,"input":input,search_by:search_by,sort_by:sort_by})}).catch(function (error) {console.dir(error);
      });
    }
  } else {
    res.render('search',{qres:"",search_by:search_by,sort_by:sort_by})
  }
})



router.use("/css",express.static(__dirname + '/css'));
module.exports = router;

