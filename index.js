const { 
    entities: { 
        Plugin 
    }, 
    webpack: {
        getModule,
        getModuleByDisplayName,
        getAllModules,
        modal,
        React
    },
    injector: {
        inject,
        uninject
    }
} = require("powercord");
const ImageModal = getModuleByDisplayName("ImageModal", false);
const { MenuItem, MenuGroup } = getModule(m => m.MenuRadioItem && !m.default, false);
const AllUserContextMenus = getAllModules(m=>
    m.default && 
    m.default.displayName && 
    /^(?=.*User)(?=.*ContextMenu)/i.test(m.default.displayName)
, false);
const copy = e => getModule(["copy"], false).copy(e);
// Below Copied from ZLibrary
const findInTree = (e,t) => t.split(".").reduce((e,p)=>e&&e[p],e);
module.exports = class AvatarViewer extends Plugin {
    startPlugin() {
        AllUserContextMenus.forEach(e=>{
            const displayName = e.default.displayName;
            inject(this.entityID+e.default.displayName, e, "default", ([{user}], ret) => {
                const children = findInTree(ret, "props.children.props.children");
                if(!Array.isArray(children)) return ret;
                else children.push(
                    React.createElement(MenuGroup, {
                        children: [
                            React.createElement(MenuItem, {
                                id: "avatar-viewer-view",
                                action: () => {
                                    this.openModal(user.getAvatarURL(getModule(['hasAnimatedAvatar'], false).hasAnimatedAvatar(user) ? "gif" : "webp").split("?")[0]+"?size=2048")
                                },
                                label: "View Avatar"
                            }),
                            React.createElement(MenuItem, {
                                id: "avatar-viewer-copy",
                                action: () => {
                                    copy(user.getAvatarURL().split("?")[0]+"?size=2048");
                                },
                                label: "Copy AvatarURL"
                            })
                        ]
                    })
                )
                return ret;
            });
            e.default.displayName = displayName;
        })
    }
    async openModal(url) {
        const MaskedLink = await getModuleByDisplayName("MaskedLink");
        modal.push(e => React.createElement(ImageModal, {
            ...e,
            src: url,
            placeholder: url,
            original: url,
            width: 2048,
            height: 2048,
            onClickUntrusted: e => e.openHref(),
            renderLinkComponent: props => React.createElement(MaskedLink, props)
        }));
    }

    pluginWillUnload() {
        AllUserContextMenus.forEach(e=>uninject(this.entityID+e.default.displayName))
    }
}
