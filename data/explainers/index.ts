// Explícamelo cards, one JSON file per topic. Card ids must be unique across files.
// Tabs show cards in the order of this list, then the order inside each file.
import pastTenses from './past-tenses.json'
import presentFuture from './present-future.json'
import passiveReportedConditionals from './passive-reported-conditionals.json'
import modalsTags from './modals-tags.json'
import articlesQuantityOrder from './articles-quantity-order.json'
import linking from './linking.json'
import grammarExtra from './grammar-extra.json'
import prepositionsPhrasal from './prepositions-phrasal.json'
import punctuation from './punctuation.json'
import register from './register.json'
import words from './words.json'

export const EXPLAINERS = { ...pastTenses, ...presentFuture, ...passiveReportedConditionals, ...modalsTags, ...articlesQuantityOrder, ...linking, ...grammarExtra, ...prepositionsPhrasal, ...punctuation, ...register, ...words }
