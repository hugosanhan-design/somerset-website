// Explícamelo cards, one JSON file per topic. Card ids must be unique across files.
// Tabs show cards in the order of this list, then the order inside each file.
import pastTenses from './past-tenses.json'
import presentFuture from './present-future.json'
import passiveReportedConditionals from './passive-reported-conditionals.json'
import modalsTags from './modals-tags.json'
import articlesQuantityOrder from './articles-quantity-order.json'
import linking from './linking.json'

export const EXPLAINERS = { ...pastTenses, ...presentFuture, ...passiveReportedConditionals, ...modalsTags, ...articlesQuantityOrder, ...linking }
