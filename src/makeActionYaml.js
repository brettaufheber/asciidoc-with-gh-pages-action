const pkg = require('../package.json');
const fs = require('fs');
const yaml = require('js-yaml');
const config = require('asciidoc-site-generator/src/config.json');

async function main() {

    let version = /^v?(\d+)\.\d+\.\d+$/u.exec(process.version);

    if (!version)
        throw new Error('Cannot get Node.js version');

    const actionYaml = {
        name: pkg.name,
        description: pkg.description,
        author: `${pkg.author.name} <${pkg.author.email}> (${pkg.author.url})`,
        inputs: {},
        runs: {
            'using': ('node' + version[1]),
            'main': pkg.mainForAction
        }
    };

    const entries = config.options.common.concat([{
        parameter: '-d, --domain <domain name>',
        description: 'The domain name of the website.',
        default: null,
        mapping: {
            key: 'domain',
            env: 'INPUT_DOMAIN'
        }
    }], config.options.buildAndPublish);

    for (const entry of entries) {

        const key = entry.mapping.env.slice(6).toLowerCase();

        actionYaml.inputs[key] = {
            description: entry.description,
            required: entry.required || false
        };

        if (entry.default != null)
            actionYaml.inputs[key]['default'] = entry.default;
    }

    await fs.promises.writeFile('action.yaml', yaml.dump(actionYaml, {lineWidth: 120, forceQuotes: true}));
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
