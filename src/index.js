const pkg = require('../package.json');
const fs = require('fs');
const path = require('path');
const generator = require('asciidoc-site-generator/src');

async function main() {

    if (('RUNNER_TEMP' in process.env) && process.env.RUNNER_TEMP)
        process.env['TMPDIR'] = process.env.RUNNER_TEMP;

    if (('GITHUB_WORKSPACE' in process.env) && process.env.GITHUB_WORKSPACE)
        process.chdir(process.env.GITHUB_WORKSPACE);

    const metadata = {
        'gh-action': {
            name: pkg.name,
            version: pkg.version,
            description: pkg.description,
            homepage: pkg.homepage
        }
    };

    if (('GITHUB_ACTION_REPOSITORY' in process.env) && process.env.GITHUB_ACTION_REPOSITORY)
        metadata['gh-action']['repository'] = process.env.GITHUB_ACTION_REPOSITORY;

    if (('INPUT_DOMAIN' in process.env) && process.env.INPUT_DOMAIN)
        metadata['domain'] = process.env.INPUT_DOMAIN;

    const configureGitHubPages = async function (_, pagesPath) {

        // use the .nojekyll file to skip default rendering of GitHub pages
        await fs.promises.writeFile(path.join(pagesPath, '.nojekyll'), '');

        // create CNAME file if required
        if (('INPUT_DOMAIN' in process.env) && process.env.INPUT_DOMAIN)
            if (!process.env.INPUT_DOMAIN.endsWith('.github.io'))
                await fs.promises.writeFile(path.join(pagesPath, 'CNAME'), process.env.INPUT_DOMAIN);
    };

    await generator.buildAndPublish(metadata, [configureGitHubPages].concat(generator.getDefaultTasks()));
}

if (require.main === module) {

    main()
        .catch((error) => {

            console.error(`An error occurred during execution`);
            console.error(error);

            process.exitCode = 1;
        });
}

module.exports = {
    main,
};
