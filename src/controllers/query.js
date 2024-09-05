import handlers from "../handlers.js"

export const queryController = async (req, res) => {
    const { handler, body } = req.body

    const [controller, action] = handler.split('.')
    if(handlers[controller]?.[action]) {
        const resp = await handlers[controller][action](body, req.context)
        res.json(resp ?? {reload: true})
    }
}