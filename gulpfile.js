const gulp = require("gulp");
const fileinclude = require("gulp-file-include");
const server = require("browser-sync").create();
const { watch, series } = require("gulp");
const cleanCSS = require("gulp-clean-css");
const clean = require("gulp-clean");
const sass = require("gulp-sass")(require("sass"));
sass.compiler = require("node-sass");

const paths = {
  scripts: {
    src: "./src/",
    dest: "./build/",
  },
};

// Reload Server
async function reload() {
  server.reload();
}

// Sass compiler
async function compileSass() {
  gulp
    .src(paths.scripts.src + "assets/scss/**/*.scss")
    // .pipe(sass.sync({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest(paths.scripts.dest + "assets/css"));
}

async function minifyCss() {
  gulp
    .src(paths.scripts.src + "assets/css/*.css")
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.scripts.dest + "assets/css"));
}

// Copy assets after build
async function copyAssets() {
  gulp
    .src([paths.scripts.src + "assets/img/**/*"])
    .pipe(gulp.dest(paths.scripts.dest + "assets/img"));
}

async function includeHTML() {
  return gulp
    .src([paths.scripts.src + "*.html"])
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(gulp.dest(paths.scripts.dest));
}

async function cleanBuildFolder() {
  return gulp
    .src(paths.scripts.dest + "assets", { read: false })
    .pipe(clean({ force: true }));
}

// Build files html and reload server
async function buildAndReload() {
  //await cleanBuildFolder();
  await compileSass();
  await includeHTML();
  await minifyCss();
  await copyAssets();
  reload();
}

exports.default = async function () {
  // Init serve files from the build folder
  server.init({
    server: {
      baseDir: paths.scripts.dest,
    },
  });
  // await cleanBuildFolder();
  // Watch Sass task
  watch(paths.scripts.src + "assets/scss/**/*.scss", series(compileSass));
  // Build and reload at the first time
  buildAndReload();
  // Watch task
  watch(
    [
      paths.scripts.src + "*.html",
      paths.scripts.src + "sections/*.html",
      paths.scripts.src + "components/*.html",
      paths.scripts.src + "assets/**/*",
    ],
    series(buildAndReload)
  );
};
