import React from 'react';
import IconButton from 'material-ui/IconButton';

export default function HeaderIconElement(props) {
    return (
        <IconButton
            iconStyle={{
                width: 48,
                height: 48,
                color: 'white',
            }}
            style={{ padding: '0' }}
        >
            {props.children}
        </IconButton>
    );
}
