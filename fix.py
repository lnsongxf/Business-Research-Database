import re
def fix_keyword(keyword):
    keyword=re.sub(r'\(.+?\)', '', keyword).strip()
    words=keyword.split()
    words_fixed=[]
    for idx, word in enumerate(words):
        word_fixed=word
        if idx==0:
            word_fixed=word.capitalize()
        else:
            if len(word)>1:
                if (word[0].isupper() and word[1].islower()):
                    word_fixed=word.lower()
        words_fixed.append(word_fixed)
    keyword=' '.join(words_fixed)
    return keyword
def validate(article):
    with open('title_remove') as f:
        title_remove_list = f.readlines()
    # you may also want to remove whitespace characters like `\n` at the end of each line
    title_remove_list = [x.strip() for x in title_remove_list] 
    title=article['ex:title'].lower()
    validate=True
    if title in title_remove_list:
        validate=False
    if title=='':
        validate=False
    return validate