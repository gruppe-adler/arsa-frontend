import { Rule } from 'eslint';
import { type AST } from 'vue-eslint-parser';

/**
 * Custom eslint rule to disallow the use of the v-t directive in Vue files.
 */
export default {
    meta: {
        type: 'suggestion'
    },
    create(context) {
        return context.sourceCode.parserServices.defineTemplateBodyVisitor({
            VAttribute(node: AST.VAttribute | AST.VDirective) {
                if (!node.directive) return;
                if (node.key.name.name !== 't') return;

                context.report({
                    loc: node.loc,
                    message: "Do not use v-t directive, use t from 'useI18n' instead"
                });

                return null;
            }
        });
    }
} satisfies Rule.RuleModule;
