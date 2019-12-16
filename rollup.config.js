// Copyright (c) 2019 ml5
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import json from '@rollup/plugin-json';
import babel from 'rollup-plugin-babel';
import html from '@rollup/plugin-html';
import { join } from 'path';
import builtins from 'rollup-plugin-node-builtins';
import { eslint } from "rollup-plugin-eslint";
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import replace from '@rollup/plugin-replace';
import dev from 'rollup-plugin-dev'
import * as packageJson from "./package.json";

const build = (cmdOptions) => {
    const isWatch = cmdOptions.watch;
    const isManualTest = cmdOptions.manualTest;

    // to supress warning for customized flag
    delete cmdOptions.isManualTest;

    let plugins = [
        replace({
            'process.env.NODE_ENV': JSON.stringify( 'production' )
        }),
        json(),
        builtins(),
        resolve({ browser: true }), 
        commonjs(),
        babel({
            include: join(__dirname, 'src'),
            externalHelpers: true,
            runtimeHelpers: true
        }),
        eslint({
            include: 'src/**'
        })
    ];

    // not watch => production
    if (!isWatch) {
        plugins.push(
            terser()
        );
    } else {
        if (!isManualTest) {
            plugins.push(
                html({
                    title: 'ml5'
                })
            );
        }

        plugins.push(
            dev({
                host: '0.0.0.0',
                dirs: ['manual-test', 'dist'],
                port: 8080
            })
        );
    }

    const buildSpec = {
        input: 'src/index.js',
        output: [
            { 
                file: isWatch ? packageJson.dev : packageJson.main, 
                format: 'umd',
                name: 'ml5',
                treeshake: true,
                sourcemap: isWatch ? false : true
            }
        ],
        onwarn(warning, rollupWarn) {
            if (warning.code !== 'CIRCULAR_DEPENDENCY'
                && warning.code !== 'MISSING_EXPORT'
                && warning.code !== 'NAMESPACE_CONFLICT') {
              rollupWarn(warning);
            }
        },
        plugins
    };

    if (isWatch) {
        buildSpec.watch = {
            include: 'src/**'
        }
    }

    return buildSpec;
}

export default build;