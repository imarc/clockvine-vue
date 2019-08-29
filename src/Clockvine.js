import ElementComponent from "./components/ElementComponent";
import ElementsComponent from "./components/ElementsComponent";
import ContinuousElementsComponent from "./components/ContinuousElementsComponent";
import PaginatedElementsComponent from "./components/PaginatedElementsComponent";
import LiveSearch from "./components/LiveSearch.vue";
import PaginationNav from "./components/PaginationNav.vue";
import ApiModule from "./modules/ApiModule";
import ElementApiModule from "./modules/ElementApiModule";
import ResetsPage from "./mixins/ResetsPage";
import SyncsWithUrl from "./mixins/SyncsWithUrl";

export default {

  /**
   * Components
   */
  ElementComponent,

  ElementsComponent,
  ContinuousElementsComponent,
  PaginatedElementsComponent,

  LiveSearch,
  PaginationNav,



  /**
   * Vuex Modules
   */
  ApiModule,
  ElementApiModule,



  /**
   * Mixins
   */
  ResetsPage,
  SyncsWithUrl,
};
