import ContinuousElements from './ContinuousElements';
import Element from './Element';
import ElementApiModule from './ElementApiModule';
import Elements from './Elements';
import Module from './Module';
import PaginatedElements from './PaginatedElements';
import Pagination from './Pagination.vue';
import ResetsPageOnChanges from './ResetsPageOnChanges';
import LiveSearch from './LiveSearch.vue';
import SyncWithUrlParameters from './SyncWithUrlParameters';

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
