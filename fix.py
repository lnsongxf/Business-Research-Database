
# coding: utf-8

# In[48]:

import re
keyword='abs (a) IT Iran'
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


# In[ ]:



