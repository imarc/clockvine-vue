const ApiModule = require("./modules/ApiModule");
const ContinuousCollectionComponent = require("./components/ContinuousCollectionComponent");
const ElementApiModule = require("./modules/ElementApiModule");
const ElementComponent = require("./components/ElementComponent");
const CollectionComponent = require("./components/CollectionComponent");
const HttpQueue = require("./HttpQueue");
const LaravelApiModule = require("./modules/LaravelApiModule");
const LiveSearch = require("./components/LiveSearch.vue");
const PaginatedCollectionComponent = require("./components/PaginatedCollectionComponent");
const PaginationNav = require("./components/PaginationNav.vue");
const ResetsPage = require("./mixins/ResetsPage");
const SyncsWithUrl = require("./mixins/SyncsWithUrl");
const withHelper = require("./helpers/with");

module.exports = {

    /**
     * Components
     */
    ElementComponent,

    CollectionComponent,
    ContinuousCollectionComponent,
    PaginatedCollectionComponent,

    /**
     * These are deprecated; use CollectionComponent going forward.
     */
    ElementsComponent: CollectionComponent,
    ContinuousElementsComponent: ContinuousCollectionComponent,
    PaginatedElementsComponent: PaginatedCollectionComponent,

    LiveSearch,
    PaginationNav,



    /**
     * Vuex Modules
     */
    ApiModule,
    ElementApiModule,
    LaravelApiModule,



    /**
     * Mixins
     */
    ResetsPage,
    SyncsWithUrl,


    /**
     * Miscellaneous
     */
    HttpQueue,
    with: withHelper,
};
