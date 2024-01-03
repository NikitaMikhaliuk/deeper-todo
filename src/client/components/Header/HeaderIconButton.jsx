import IconButton from 'material-ui/IconButton';

export default function HeaderIconElement({ children }) {
    return (
        <IconButton
            iconStyle={{
                width: 48,
                height: 48,
                color: 'white',
            }}
            style={{ padding: '0' }}
        >
            {children}
        </IconButton>
    );
}
