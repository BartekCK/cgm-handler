export const lambdaHandler = async (event: Record<string, unknown>) => {
    console.log(event);

    return 'value';
};
