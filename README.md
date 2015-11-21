[![Build Status](https://travis-ci.org/butchmarshall/ruby-jive-sdk-example-simpleapp.svg?branch=master)](https://travis-ci.org/butchmarshall/ruby-jive-sdk-example-simpleapp)

# ruby-jive-sdk-example-simpleapp

Ruby implementation of the Jive [simpleapp](https://community.jivesoftware.com/docs/DOC-114554)

Release Notes
============

**0.0.1**
 - Initial commit

## Installation

git clone https://github.com/butchmarshall/ruby-jive-sdk-example-simpleapp.git

cd ruby-jive-sdk-example-simpleapp

bundle install

rake db:migrate

passenger start

Modify the service_url in /extension_src/meta.json to point to your externally accessible URL!

Zip the contents of extension_src (without the folder extension_src!)

Upload the zipped package to Jive

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/butchmarshall/ruby-jive-sdk-example-simpleapp.

## License

The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).