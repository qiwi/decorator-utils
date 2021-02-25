module.exports = {
    extends: [
        'eslint-config-qiwi',
        'prettier',
    ],
    rules: {
        'unicorn/no-null': 'off',
        'lines-between-class-members': 'off'
    },
    overrides: [
        {
            files: ['./src/test/**/*.{ts,js}'],
            rules: {
                '@typescript-eslint/no-unused-vars': 'off'
            }
        }
    ]
};
