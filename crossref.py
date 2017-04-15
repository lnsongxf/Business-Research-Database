import os
import urllib
crossref='http://api.crossref.org/journals/<issn>/works?rows=1000&filter=from-pub-date:<year>,until-pub-date:<year>'
for issn in ['1047-7047','0742-1222']:
	print issn	
	journal_folder='doi/'+issn+'/'
	if not os.path.exists(journal_folder):
		os.makedirs(journal_folder)
	crossref_issn=crossref.replace('<issn>',issn)
	for year in range(1990,2018):
		print year,': ' 
		url=crossref_issn.replace('<year>',str(year))
		print url
		try: 
			urllib.urlretrieve (url,journal_folder+str(year))
		except:
			pass
		print


