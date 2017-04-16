import re
def fix_keyword(keyword):
    keyword=re.sub(r'\(.+?\)', '', keyword).strip()
    if len(keyword)>1:
        if (keyword[0].islower() and keyword[1].islower()):
            keyword=keyword[0].capitalize()+keyword[1:]                        
    return keyword
def validate(article):
    with open('title_remove') as f:
        title_remove_list = f.readlines()
    # you may also want to remove whitespace characters like `\n` at the end of each line
    title_remove_list = [x.strip() for x in title_remove_list] 
    title=article['e:title'].lower()
    validate=True
    if title in title_remove_list:
        validate=False
    if title=='':
        validate=False
    return validate