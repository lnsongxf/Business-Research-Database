import os
import wget
crossref='http://api.crossref.org/journals/<issn>/works?filter=from-pub-date:<year>,until-pub-date:<year>'
for issn in ['1047-7047','0742-1222'][1:2]:
	print issn	
	journal_folder='doi/'+issn+'/'
	if not os.path.exists(journal_folder):
		os.makedirs(journal_folder)
	crossref_issn=crossref.replace('<issn>',issn)
	for year in range(2000,2018):
		print year,': ' 
		url=crossref_issn.replace('<year>',str(year))
		print url
		try: 
			filename = wget.download(url,journal_folder+str(year))
		except:
			pass
		print


