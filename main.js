var response = require("ringo/jsgi/response");
var {isFileName, endsWith} = require("ringo/utils/strings");

var {Application} = require("stick");
var app = exports.app = Application();

app.configure("params", "route");

// the server-side template loader is Reinhardt
var {Reinhardt} = require("reinhardt");
var templates = new Reinhardt({
   loader: module.resolve("templates")
});

// repository for the client-side templates
var webapp = getRepository("./templates/webapp/");

// the root route renders the skeleton which bootstraps backbone et al.
app.get("/", function(req) {
   // renders the frontpage
   return response.html(templates.getTemplate("skeleton.html").render({
      htmlContent: '<div id="content"></div>'
   }));
});

// handler for direct subpage requests
app.get("/:subpage", function(req, subpage) {
   var template = subpage + ".html";

   // check if the template is valid and exists
   if (isFileName(template)) {
      var resource = webapp.getResource(template);
      if (resource.exists()) {
         // render the page
         return response.html(templates.getTemplate("skeleton.html").render({
            htmlContent: '<div id="content">' + templates.getTemplate("webapp/" + template).render({}) + '</div>'
         }));
      }
   }

   return response.notFound().text("Page not found.");
});

// returns the web application's templates to the browser
// which renders them with nunjucks
app.get("/templates/webapp/:template", function(req, template) {
   if (isFileName(template) && endsWith(template, ".html")) {
      var resource = webapp.getResource(template);
      if (resource.exists()) {
         return response.static(resource);
      }
   }

   return response.notFound().text("Template not found.");
});

if (require.main == module) {
   require("ringo/httpserver").main(module.id);
}