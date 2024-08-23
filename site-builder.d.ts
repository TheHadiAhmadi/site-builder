// site-builder.d.ts

// Declare the imports from `#services`
declare module "#services" {
    export * from "./services/index.js";
  }
  
  // Declare the imports from `#modules`
  declare module "#modules" {
    export * from "./modules/index.js";
  }
  
  // Declare the imports for any module inside `#modules`
  declare module "#modules/*" {
    // Since this wildcard import is general, you may need to adjust based on specific module types
    const content: any;
    export = content;
  }
  