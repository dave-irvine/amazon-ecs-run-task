const core = require('@actions/core');
const aws = require('aws-sdk');

async function run() {
    try {
        const ecs = new aws.ECS({
            customUserAgent: 'amazon-ecs-run-task-for-github-actions'
        });

        // Get inputs
        const taskDefinition = core.getInput('task-definition', { required: true });
        const launchType = core.getInput('launch-type', { required: true });
        const cluster = core.getInput('cluster', { required: false });
        const subnetsInput = core.getInput('subnets', { required: false });
        const securityGroupsInput = core.getInput('security-groups', { required: false });
        const tagsInput = core.getInput('tags', { required: false });
        const assignPublicIp = core.getInput('assign-public-ip', { required: false });
        const waitForTask = core.getInput('wait-for-task-running', { required: false }) || 'true';

        const subnets = subnetsInput.split(",");
        const securityGroups = securityGroupsInput.split(",");
        const tagsArray = tagsInput.split(",");
        const tags = tagsArray.map((tag) => {
            const [key, value] = tag.split(":");

            return {
                key,
                value
            };
        });

        try {
            const params = {
                cluster,
                taskDefinition,
                launchType,
                networkConfiguration: {
                    awsvpcConfiguration: {
                        subnets,
                        assignPublicIp,
                        securityGroups,
                    }
                },
                tags
            };

            const data = await ecs.runTask(params).promise();
            const taskARN = data.tasks[0].taskArn;

            core.setOutput("task-arn", taskARN);

            if (waitForTask) {
                await ecs.waitFor('tasksRunning', {
                    tasks: [ taskARN ],
                }).promise();
            }
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