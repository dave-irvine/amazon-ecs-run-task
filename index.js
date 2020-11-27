const core = require('@actions/core');
const aws = require('aws-sdk');

async function run() {
    try {
        const ecs = new aws.ECS({
            customUserAgent: 'amazon-ecs-run-task-for-github-actions'
        });

        // Get inputs
        const taskDefinition = core.getInput('task-definition', { required: true });
        const cluster = core.getInput('cluster', { required: false });

        try {
            const params = {
                cluster,
                taskDefinition
            };

            await ecs.runTask(params).promise();
        } catch (error) {
            core.setFailed("Failed to run task in ECS: " + error.message);
            throw (error);
        }
    }
    catch (error) {
        core.setFailed(error.message);
        core.debug(error.stack);
    }
}

module.exports = run;

/* istanbul ignore next */
if (require.main === module) {
    run();
}