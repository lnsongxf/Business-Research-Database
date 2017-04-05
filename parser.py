from bs4 import BeautifulSoup as bs
import fix
def parse_sag(html):
    creators=[] 
    article={}
    article={}
    article['ex:creator']=[]
    article['ex:keyword']=[]
    article['ex:issue']='0';article['ex:volume']='0'
    article['ex:date']=' '
    s = bs(html, 'lxml').find('head')
    s_body=bs(html, 'lxml').find('body')
    try:
        vol_iss_year=s_body.find('div',{"class":"articleJournalNavTitle"}).text.replace('\n','').replace('\t','')
        article['ex:date']=vol_iss_year[-4:]
        article['ex:issue']= vol_iss_year.split('Issue ')[1].split(', ')[0]         
        article['ex:volume']= vol_iss_year.split('Vol ')[1].split(', ')[0]            
    except Exception:
        article['ex:date']=s_body.find('div',{"class":"published-dates"}).text.split('\n')[1][-4:]
        pass
    j=''
    for c in s.findAll("meta",{"name":"dc.Creator"}):
        creator={}
        creator['ex:name']=c['content']
        creators.append(creator)
    keywords=s.find("meta",{"name":"keywords"})
    if keywords is not None: 
        for k in keywords['content'].split(','):
            try:
                article['ex:keyword'].append(fix.fix_keyword(k))
            except Exception as e: 
                print str(e)
                print article
                print k

    article['ex:title']=s.find("meta",{"name":"dc.Title"})['content']

    doi=s.find("meta",{"name":"dc.Source"})['content']
    if doi is not None:
        article['ex:url']=doi

    abstract=s.find("meta",{"name":"dc.Description"})
    if abstract is not None:
        article['ex:abstract']= abstract['content']

    article['ex:source']= s.find("meta",{"name":"citation_journal_title"})['content']
    article['ex:creator']=creators
    return article

def parse_wly(html):
    creators=[] 
    article={}
    article={}
    article['ex:creator']=[]
    article['ex:keyword']=[]
    article['ex:issue']='0';article['ex:volume']='0'
    article['ex:date']=' '
    s = bs(html, 'lxml').find('head')
    s_body=bs(html, 'lxml').find('body')
    try:
        vol_iss_year=s_body.find('div',{"class":"articleJournalNavTitle"}).text.replace('\n','').replace('\t','')
        article['ex:date']=vol_iss_year[-4:]
        article['ex:issue']= vol_iss_year.split('Issue ')[1].split(', ')[0]         
        article['ex:volume']= vol_iss_year.split('Vol ')[1].split(', ')[0]            
    except Exception:
        article['ex:date']=s_body.find('div',{"class":"published-dates"}).text.split('\n')[1][-4:]
        pass
    j=''
    for c in s.findAll("meta",{"name":"dc.Creator"}):
        creator={}
        creator['ex:name']=c['content']
        creators.append(creator)
    keywords=s.find("meta",{"name":"keywords"})
    if keywords is not None: 
        for k in keywords['content'].split(','):
            try:
                article['ex:keyword'].append(fix.fix_keyword(k))
            except Exception as e: 
                print str(e)
                print article
                print k

    article['ex:title']=s.find("meta",{"name":"dc.Title"})['content']

    doi=s.find("meta",{"name":"dc.Source"})['content']
    if doi is not None:
        article['ex:url']=doi

    abstract=s.find("meta",{"name":"dc.Description"})
    if abstract is not None:
        article['ex:abstract']= abstract['content']

    article['ex:source']= s.find("meta",{"name":"citation_journal_title"})['content']
    article['ex:creator']=creators
    return article