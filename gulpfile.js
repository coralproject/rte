"use strict";

const gulp = require("gulp");
const del = require("del");
const ts = require("gulp-typescript");
const merge = require("merge2");
const sourcemaps = require("gulp-sourcemaps");

const files = {
  ts: ["./src/**/*.ts", "./src/**/*.tsx", "./src/**/*.d.ts"],
};

function onBuildError() {
  this.once("finish", () => process.exit(1));
}

function build(dest, module) {
  return () => {
    const tsProject = ts.createProject("tsconfig.json", {
      noEmit: false,
      noEmitOnError: true,
      declaration: true,
      target: "es5",
      module,
    });

    let src = gulp.src(files.ts);
    const tsResult = src
      .pipe(sourcemaps.init())
      .pipe(tsProject())
      .once("error", onBuildError);
    return merge([
      tsResult.dts.pipe(gulp.dest(dest)),
      tsResult.js.pipe(sourcemaps.write(".")).pipe(gulp.dest(dest)),
    ]);
  };
}

gulp.task("clean", () => del(["lib", "cjs"]));
gulp.task("lib", build("lib", "es6"));
gulp.task("commonjs", build("cjs", "commonjs"));
gulp.task("build", gulp.parallel("lib", "commonjs"));

gulp.task("default", gulp.series("clean", "build"));
