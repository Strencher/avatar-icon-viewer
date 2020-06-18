const { 
    entities: { 
        Plugin 
    }, 
    webpack: {
        getModule,
        getModuleByDisplayName,
        React
    },
    injector: {
        inject,
        uninject
    }
} = require("powercord");
const ImageModal = getModuleByDisplayName("ImageModal", false);
const { MenuItem, MenuGroup } = getModule(m => m.MenuRadioItem && !m.default, false);
const GuildChannelUserContextMenu = getModule(m => m.default && m.default.displayName === 'GuildChannelUserContextMenu', false);
const ModalStack = getModule(["push", "popAll"], false);
const copy = e=>getModule(["copy"], false).copy(e);
module.exports = class AvatarViewer extends Plugin {
    get id() {return "avatar-viewer"}
    startPlugin() {
        if(GuildChannelUserContextMenu) inject(this.id, GuildChannelUserContextMenu, "default", (args, ret) => {
            const [props] = args;
            if(!ret || !ret.props || !ret.props.children || !ret.props.children.props || !Array.isArray(ret.props.children.props.children)) return ret;
            else ret.props.children.props.children.push(
                React.createElement(MenuGroup, {
                    children: [
                        React.createElement(MenuItem, {
                            id: "avatar-viewer-view",
                            action: () => {
                                this.openModal(props.user.getAvatarURL(getModule(['hasAnimatedAvatar'], false).hasAnimatedAvatar(props.user) ? "gif" : "webp").split("?")[0]+"?size=2048")
                            },
                            label: "View Avatar"
                        }),
                        React.createElement(MenuItem, {
                            id: "avatar-viewer-copy",
                            action: () => {
                                copy(props.user.getAvatarURL().split("?")[0]+"?size=2048");
                            },
                            label: "Copy AvatarURL"
                        })
                    ]
                })
            )
            return ret;
        })
        GuildChannelUserContextMenu.default.displayName = 'GuildChannelUserContextMenu';
    }

    openModal(url) {
        ModalStack.push(e => React.createElement(ImageModal, {
            ...e,
            src: url,
            placeholder: url,
            original: url,
            width: 2048,
            height: 2048,
            onClickUntrusted: e => e.openHref()
        }));
    }

    pluginWillUnload() {
        uninject(this.id);
    }
}