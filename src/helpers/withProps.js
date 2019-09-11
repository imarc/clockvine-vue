export default (withProps, props) => {
    return {
        components: {withProps},
        data: () => ({props}),
        template: `<with-props v-bind="props" />`
    };
};
