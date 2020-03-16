/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(['require',
    'backbone',
    'hbs!tmpl/audit/CreateAuditTableLayoutView_tmpl',
    'utils/Enums',
    'utils/CommonViewFunction',
    'utils/Utils'
], function(require, Backbone, CreateAuditTableLayoutViewTmpl, Enums, CommonViewFunction, Utils) {
    'use strict';

    var CreateAuditTableLayoutView = Backbone.Marionette.LayoutView.extend(
        /** @lends CreateAuditTableLayoutView */
        {
            _viewName: 'CreateAuditTableLayoutView',

            template: CreateAuditTableLayoutViewTmpl,

            /** Layout sub regions */
            regions: {},

            /** ui selector cache */
            ui: {
                auditValue: "[data-id='auditValue']",
                name: "[data-id='name']",
                nameContainer: "[data-id='nameContainer']",
                noData: "[data-id='noData']",
                tableAudit: "[data-id='tableAudit']",
                auditHeaderValue: "[data-id='auditHeaderValue']",
                attributeDetails: "[data-id='attributeDetails']",
                attributeCard: "[data-id='attribute-card']",
                labelsDetailsTable: "[data-id='labelsDetails']",
                labelCard: "[data-id='label-card']",
                customAttributeDetails: "[data-id='customAttributeDetails']",
                customAttrCard: "[data-id='custom-attr-card']",
                relationShipAttributeDetails: "[data-id='relationShipAttributeDetails']",
                relationshipAttrCard: "[data-id='relationship-attr-card']",
                attributeDetailCard: "[data-id='attributeDetail-card']",
                detailsAttribute: "[data-id='detailsAttribute']",
                panelAttrHeading: "[data-id='panel-attr-heading']",
                nameUpdate: "[data-id='name-update']"

            },
            /** ui events hash */
            events: function() {
                var events = {};
                events["click " + this.ui.auditCreate] = "onClickAuditCreate";
                return events;
            },
            /**
             * intialize a new CreateAuditTableLayoutView Layout
             * @constructs
             */
            initialize: function(options) {
                _.extend(this, _.pick(options, 'guid', 'entityModel', 'action', 'entity', 'entityName', 'attributeDefs'));
            },
            bindEvents: function() {},
            onRender: function() {
                this.auditTableGenerate();
            },
            createTableWithValues: function(tableDetails) {
                var attrTable = CommonViewFunction.propertyTable({
                    scope: this,
                    valueObject: tableDetails
                });
                return attrTable;

            },
            updateName: function(name) {
                this.ui.name.text(name);
            },
            noDetailsShow: function() {
                this.ui.noData.removeClass('hide');
            },
            auditTableGenerate: function() {
                var that = this,
                    table = "";
                var detailObj = this.entityModel.get('details');
                if (detailObj && detailObj.search(':') >= 0) {
                    var parseDetailsObject = detailObj.split(':');
                    if (parseDetailsObject.length > 1) {
                        parseDetailsObject.shift();
                        var auditData = parseDetailsObject.join(":");
                    }
                    try {
                        parseDetailsObject = JSON.parse(auditData);
                        var skipAttribute = parseDetailsObject.typeName ? "guid" : null,
                            name = Utils.getName(parseDetailsObject, null, skipAttribute);
                        if (name == "-") {
                            name = _.escape(parseDetailsObject.typeName);
                        }
                        var name = ((name ? name : this.entityName));
                        that.updateName(name);
                        if (parseDetailsObject) {
                            var attributesDetails = parseDetailsObject.attributes,
                                customAttr = parseDetailsObject.customAttributes,
                                labelsDetails = parseDetailsObject.labels,
                                relationshipAttributes = parseDetailsObject.relationshipAttributes;
                            if (attributesDetails) {
                                that.ui.attributeDetails.removeClass('hide');
                                that.action.indexOf("Classification") === -1 ? that.ui.panelAttrHeading.html("Technical properties ") : that.ui.panelAttrHeading.html("Properties ");
                                var attrTable = that.createTableWithValues(attributesDetails);
                                that.ui.attributeCard.html(
                                    attrTable);
                            }
                            if (!_.isEmpty(customAttr)) {
                                that.ui.customAttributeDetails.removeClass('hide');
                                var customAttrTable = that.createTableWithValues(customAttr);
                                that.ui.customAttrCard.html(
                                    customAttrTable);
                            }
                            if (!_.isEmpty(labelsDetails)) {
                                this.ui.labelsDetailsTable.removeClass('hide');
                                var labelsTable = '';
                                _.each(labelsDetails, function(value, key, list) {
                                    labelsTable += "<label class='label badge-default'>" + value + "</label>";
                                });
                                that.ui.labelCard.html(
                                    labelsTable);
                            }
                            if (!_.isEmpty(relationshipAttributes)) {
                                that.ui.relationShipAttributeDetails.removeClass('hide');
                                var relationshipAttrTable = that.createTableWithValues(relationshipAttributes);
                                that.ui.relationshipAttrCard.html(
                                    relationshipAttrTable);
                            }
                            if (!attributesDetails && !customAttr && !labelsDetails && !relationshipAttributes) {
                                that.ui.detailsAttribute.removeClass('hide');
                                var attrDetailTable = that.createTableWithValues(parseDetailsObject);
                                that.ui.attributeDetailCard.html(
                                    attrDetailTable);
                            }
                        } else {
                            that.noDetailsShow();
                        }
                    } catch (err) {
                        if (_.isArray(parseDetailsObject)) {
                            var name = _.escape(parseDetailsObject[0]);
                        }
                        that.updateName(name);
                        that.noDetailsShow();
                    }

                } else if (detailObj == "Deleted entity" || detailObj == "Purged entity") {
                    this.entityName ? that.updateName(this.entityName) : this.ui.nameContainer.empty().append("<h4 class='text-center'><i>No Records Found!</i></h4>");
                }
            }
        });
    return CreateAuditTableLayoutView;
});